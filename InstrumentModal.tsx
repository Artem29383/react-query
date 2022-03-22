import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, View} from 'react-native';
import styled from 'styled-components/native';

// eslint-disable-next-line max-len
import AnimatedContainerWithTabs from '../../../common/components/containers/AnimatedContainer/AnimatedContainerWithTabs';
import Spinner from '../../components/loaders/Spinner';
import InstrumentTradingButtons from '../OperationCreator/buttons/InstrumentTradingButtons';
import BondCouponPayments from './components/BondCouponPayments/BondCouponPayments';
import InstrumentDividends from './components/InstrumentDividends/InstrumentDividends';
import {InstrumentHeader} from './components/InstrumentHeader/InstrumentHeader';
import BondDetailsTabContent from './TabContents/BondDetailsTabContent/BondDetailsTabContent';
import FinParamTabContent from './TabContents/FinParamTabContent/FinParamTabContent';
import InfoTabContent from './TabContents/InfoTabContent/InfoTabContent';
import {InstrumentNewsTabContent} from './TabContents/InstrumentNewsTabContent';
// eslint-disable-next-line max-len
import InstrumentPortfolioPositionsTabContent from './TabContents/InstrumentPortfolioPositionsTabContent/InstrumentPortfolioPositionsTabContent';
import InstrumentPriceTabContent from './TabContents/InstrumentPriceTabContent/InstrumentPriceTabContent';
import OrderBookTabContent from './TabContents/OrderBookTabContent/OrderBookTabContent';
// eslint-disable-next-line max-len
import InstrumentCardScrollContent from '@src/tezis/screens/Instrument/TabContents/components/InstrumentCardScrollContent';

import CatalogBond from '@core/dictionaries/catalog/CatalogBond';
import CatalogCurrencyInstrument from '@core/dictionaries/catalog/CatalogCurrencyInstrument';
import CatalogStock from '@core/dictionaries/catalog/CatalogStock';
import {useCatalogInstrument} from '@core/dictionaries/catalog/useCatalogInstruments';
import {usePortfolioAccounts} from '@core/portfolio/account/usePortfolioAccount';
import shadowStyle from '@src/common/styles/shadow';
import {usePrevious} from '@src/common/utils/hooks/hooks';
import {ThemeProps} from '@src/common/utils/theme';
import useInteractionManager from '../../../common/utils/hooks/useInteractionManager';
import {navigationGoTo, NavigationRoute, navigationSetParams, navigatorCommon} from '../../navigation/navigation';
import {TabKey} from './constants';
import CatalogInstrument from '@core/dictionaries/catalog/CatalogInstrument';
import {useLayout} from '@src/common/utils/hooks/layout';
import {convertSpecWidthToPx} from '@src/common/utils/style';
import {AppLinkService} from "@src/tezis/services/appLinkService";
import {openInstrumentModal} from "@src/tezis/screens/Catalog/utils";

interface IProps {
    route: NavigationRoute<any>;
}

const Container = styled.View`
    align-items: center;
    background-color: ${({theme}: ThemeProps) => theme.palette.background.level1};
    height: 100%;
    justify-content: center;
    width: 100%;
`;

const SpinnerContainer = styled.View`
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
`;

const TradingButtons = styled(InstrumentTradingButtons)`
    background-color: ${({theme}: ThemeProps) => theme.palette.background.level1};
    padding-horizontal: ${({theme}: ThemeProps) => theme.indent.regular * 3}px;
    padding-vertical: ${({theme}: ThemeProps) => theme.indent.regular}px;
    width: 100%;
`;

const initialHeaderHeight = convertSpecWidthToPx(133);

const InstrumentModal: React.FC<IProps> = ({route}) => {
    const animationValue = useRef(new Animated.Value(0)).current;
    const interactionsCompleted = useInteractionManager();
    const isFocused = useIsFocused();
    const [{height: headerHeight}, onHeaderLayout] = useLayout({height: initialHeaderHeight});

    const instrumentIdFromParams = route?.params?.instrumentId;
    const instrumentName = route?.params?.instrumentName;
    const instrumentFromParams: CatalogInstrument = route?.params?.instrument;
    const loadedInstrument = useCatalogInstrument(!instrumentFromParams ? instrumentIdFromParams : undefined);
    const instrument = instrumentFromParams ?? loadedInstrument;
    console.info('rrr', route?.params);
    const {data: accounts, loading} = usePortfolioAccounts();

    useEffect(() => {
        if (isFocused) {
            animationValue.setValue(0);
        }
    }, [isFocused]);

    let inPortfolio =
        instrument?.id && accounts.some((account) => (account.getInstrumentPosition(instrument.id)?.value || 0) > 0);

    if (instrument instanceof CatalogCurrencyInstrument) {
        inPortfolio = accounts.some((account) => {
            const position = account.getFundsPosition(instrument.faceUnit ?? '');
            return (position ? position?.valuation.get(position.currency) ?? 0 : 0) > 0;
        });
    }

    const getTabKeys = useCallback<() => TabKey[]>(() => {
        const keys = [TabKey.PRICE];
        if (!(instrument instanceof CatalogCurrencyInstrument && instrument.isIncompleteLot)) {
            keys.push(TabKey.ORDERBOOK);
        }
        if (inPortfolio) {
            keys.unshift(TabKey.PORFOLIO);
        }
        if (instrument) {
            if (instrument.issuerDescription || instrument.description) {
                keys.push(TabKey.INFO);
            }
            if (
                instrument.dividendsTracked &&
                (instrument instanceof CatalogStock || instrument.baseType.isDepoReceipt)
            ) {
                keys.push(TabKey.DIVIDENDS);
            }
            if (instrument.finparamsTracked) {
                keys.push(TabKey.FIN_PARAMS);
            }
        }
        if (instrument instanceof CatalogBond) {
            keys.push(TabKey.COUPONS);
        }
        if (instrument?.newsTracked) {
            keys.push(TabKey.NEWS);
        }

        return keys;
    }, [instrument, inPortfolio]);

    const tabKeys = getTabKeys();
    const showTabs = tabKeys.length > 1;

    const defaultTabKeyFromParams = route?.params?.defaultTabKey;
    const defaultTabIndex =
        defaultTabKeyFromParams && tabKeys.indexOf(defaultTabKeyFromParams) !== -1
            ? tabKeys.indexOf(defaultTabKeyFromParams)
            : 0;
    const defaultTabKey = tabKeys[defaultTabIndex];

    const [tabIndex, setTabIndex] = useState(defaultTabIndex);

    const prevTabIndex = usePrevious(tabIndex);
    const prevTabKey = usePrevious(tabKeys[tabIndex]);

    useEffect(() => {
        if (prevTabKey !== tabKeys[tabIndex] && prevTabIndex === tabIndex && instrument) {
            let newTabIndex = tabKeys.indexOf(prevTabKey);
            if (newTabIndex === -1) {
                newTabIndex = 0;
            }
            setTabIndex(newTabIndex);
        }
    }, [inPortfolio, instrument, prevTabIndex, prevTabKey, tabIndex, tabKeys]);

    useEffect(() => {
        if (defaultTabKey !== prevTabKey && instrument) {
            setTabIndex(defaultTabIndex);
        }
    }, [defaultTabKey]);

    if (!instrument) return null;

    const headerRenderer = (props) => {
        return (
            <View onLayout={onHeaderLayout}>
                <InstrumentHeader
                    animationValue={animationValue}
                    instrument={instrument}
                    instrumentName={instrumentName}
                    inPortfolio={inPortfolio}
                    index={tabIndex}
                    onChangeIndex={(index) => {
                        setTabIndex(index);
                        navigationSetParams({
                            instrumentId: instrument.id,
                            defaultTabKey: tabKeys[index],
                        });
                    }}
                    tabs={tabKeys}
                    showTabs={showTabs}
                    {...props}
                />
            </View>
        );
    };

    const itemRenderer = ({item: tabKey}) => {
        if (!interactionsCompleted || !isFocused || !instrument) {
            return (
                <SpinnerContainer>
                    <Spinner />
                </SpinnerContainer>
            );
        }
        if (tabKey === TabKey.NEWS) {
            return <InstrumentNewsTabContent instrumentId={instrument.id} />;
        }
        if (tabKey === TabKey.ORDERBOOK) {
            return <OrderBookTabContent instrument={instrument} active={tabKeys[tabIndex] === tabKey} />;
        }
        const showTradingButtons = tabKey === TabKey.PRICE || tabKey === TabKey.PORFOLIO;
        return (
            <>
                <InstrumentCardScrollContent style={{paddingTop: headerHeight}}>
                    {renderItemContent(tabKey)}
                </InstrumentCardScrollContent>
                {showTradingButtons && <TradingButtons instrument={instrument} style={shadowStyle.menu} />}
            </>
        );
    };

    const renderItemContent = (tabKey) => {
        switch (tabKey) {
            case TabKey.PRICE:
                if (instrument instanceof CatalogBond) {
                    return <BondDetailsTabContent instrument={instrument} />;
                }
                return <InstrumentPriceTabContent instrument={instrument} />;
            case TabKey.INFO:
                return <InfoTabContent instrument={instrument} />;
            case TabKey.FIN_PARAMS:
                return <FinParamTabContent instrument={instrument} />;
            case TabKey.DIVIDENDS:
                return <InstrumentDividends active={tabKeys[tabIndex] === TabKey.DIVIDENDS} instrument={instrument} />;
            case TabKey.COUPONS:
                return (
                    <BondCouponPayments
                        active={tabKeys[tabIndex] === TabKey.COUPONS}
                        instrument={instrument as CatalogBond}
                    />
                );
            case TabKey.PORFOLIO:
                return (
                    <InstrumentPortfolioPositionsTabContent
                        instrument={instrument}
                        accounts={accounts}
                        isAwaitingAccountPositions={loading}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Container>
            <AnimatedContainerWithTabs
                tabIndex={tabIndex}
                onTabIndexChange={setTabIndex}
                defaultTabIndex={defaultTabIndex}
                data={getTabKeys()}
                itemRenderer={itemRenderer}
                headerRenderer={headerRenderer}
                minHeaderHeight={headerHeight}
                maxHeaderHeight={headerHeight}
                animationValue={animationValue}
            />
        </Container>
    );
};

export default React.memo(InstrumentModal);
