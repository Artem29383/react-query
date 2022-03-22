import {DarkTheme, DefaultTheme, NavigationContainer, Route} from '@react-navigation/native';
import React, {useContext, useEffect} from 'react';
import {BackHandler, Platform} from 'react-native';
import {useSelector} from 'react-redux';
import {ThemeContext} from 'styled-components/native';

import BackdropOverlay from '../components/overlay/BackdropOverlay/BackdropOverlay';
import BackdropOverlaySpinner from '../components/overlay/BackdropOverlay/components/BackdropOverlaySpinner';

import DataActions from '@core/actions/DataActions';
import {UserInfoStore} from '@core/personal/user/UserInfoStore';
import {MetricaEvents, sendMetricaEvent} from '@src/common/native/Metrica';
import {ApplicationService} from '../../common/services/application';
import {overlayHide} from '@src/common/store/actions/overlay';
import {INtAuthState} from '@src/common/store/reducers/auth';
import {INtUpdateState} from '@src/common/store/reducers/update';
import {ESecureStorageKey, getStorageObject} from '@src/common/utils/storage';
import {AppLinkService} from '../services/appLinkService';
import {ChatService} from '../services/chat';
import {NotificationsService} from '../services/notifications';
import {setThemeInitialized} from '../store/actions/theme';
import {IThemeState} from '../store/reducers/theme';
import store from '../store/store';
import {INtStoreState} from '../store/store';
import {setCoreOptions} from '../utils/core';
import {hideSplashScreen} from '../utils/splashscreen';
import {Navigation} from './classes/Navigation';
import {getLinking} from './linking';
import {registerAlerts} from './navigators/alert';
import {AuthStackNavigator, PinCreateNavigator, PinInputNavigator, PreloadNavigator} from './navigators/authorization';
import {BottomTabNavigator} from './navigators/bottomtab';
import {
    navigatorAuth,
    navigatorCatalog,
    navigatorCommon,
    navigatorMain,
    navigatorModal,
    navigatorOther,
    navigatorOverlay,
    navigatorPin,
    navigatorPortfolio,
} from './navigators/navigators';
import {registerOverlays} from './navigators/overlay';
import {UpdateNavigator} from './navigators/update';
import {IPushNotification} from '@src/common/services/notifications';
import {AppsFlyerEvents, sendAppsFlyerEvent} from '@src/common/native/AppsFlyer';
import {AlertActions} from '@src/common/store/actions/alert';

export type navigatorKey =
    | navigatorAuth
    | navigatorPin
    | navigatorMain
    | navigatorModal
    | navigatorOverlay
    | navigatorCatalog
    | navigatorOther
    | navigatorPortfolio
    | navigatorCommon;

export type NavigationRoute<P> = Route<navigatorKey> & {params: P | undefined};

export {
    navigatorAuth,
    navigatorCatalog,
    navigatorCommon,
    navigatorPin,
    navigatorMain,
    navigatorModal,
    navigatorOther,
    navigatorOverlay,
    navigatorPortfolio,
};

export enum navigatorModalShowcase {
    Development = 'modalShowcase.Development',
    Empty = 'modalShowcase.Empty',
    Icons = 'modalShowcase.Icons',
    Instrument = 'modalShowcase.Instrument',
}

const navigation = new Navigation<navigatorKey>(store);
registerOverlays(navigation);
registerAlerts(navigation);

export const getNavigation = () => {
    return navigation;
};

export const navigationGoTo = navigation.navigate;
export const navigationGoBack = navigation.back;
export const navigationSetParams = navigation.setParamsNavigate;
export const setTopLevelNavigator = navigation.setTopLevelNavigator;
export const getTopLevelNavigator = navigation.getTopLevelNavigator;

export const Navigator = () => {
    useEffect(() => {
        setCoreOptions();
        initialization();
        userSettingsInitialization();
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', backHandler);
        }
    }, []);
    const theme = useContext(ThemeContext);

    const isLoaderVisible = useSelector<INtStoreState, boolean>((state) => state.loader.application || false);
    return (
        <NavigationContainer
            ref={(navigatorRef) => {
                setTopLevelNavigator(navigatorRef);
            }}
            theme={theme.name === 'dark' ? DarkTheme : DefaultTheme}
            linking={getLinking()}>
            {renderNavigator()}
            {isLoaderVisible && (
                <BackdropOverlay>
                    <BackdropOverlaySpinner />
                </BackdropOverlay>
            )}
        </NavigationContainer>
    );
};

const backHandler = (): boolean => {
    const {overlay} = store.getState();
    if (overlay.route && !overlay.withoutCloseOnBackButtonPress) {
        store.dispatch(overlayHide());
        return true;
    }
    return false;
};

const initialization = () => {
    ApplicationService.initialization({
        servicesToInit: [NotificationsService, ChatService, AppLinkService],
        store,
        afterAuthStateHandled(prevState: RecursivePartial<INtStoreState>, nextState: RecursivePartial<INtStoreState>) {
            const afterInitialized =
                (!prevState.auth?.authInitialized || !prevState.theme?.themeInitialized) &&
                nextState.auth?.authInitialized &&
                nextState.theme?.themeInitialized;

            if (afterInitialized) {
                hideSplashScreen();
                return;
            }
            if (
                nextState.auth?.isAuthenticated &&
                !prevState.auth?.pinAuthorized &&
                nextState.auth.pinAuthorized &&
                nextState.notifications?.notificationTapped
            ) {
                NotificationsService.processNotificationTapped(
                    nextState.notifications?.notificationTapped as IPushNotification,
                );
            }
            if (!nextState.auth?.isAuthenticated && nextState.notifications?.notificationTapped) {
                NotificationsService.clearNotificationTapped();
            }
        },
        afterNotificationsStateHandled(
            prevState: RecursivePartial<INtStoreState>,
            nextState: RecursivePartial<INtStoreState>,
        ) {
            if (
                nextState.auth?.isAuthenticated &&
                prevState.auth?.isAuthenticated &&
                nextState.auth?.pinAuthorized &&
                prevState.auth?.pinAuthorized &&
                nextState.notifications?.notificationTapped &&
                prevState.notifications?.notificationTapped?.uid !== nextState.notifications.notificationTapped.uid
            ) {
                NotificationsService.processNotificationTapped(
                    nextState.notifications.notificationTapped as IPushNotification,
                );
            }
        },

        beforeSignInCb: beforeSignIn,
        beforeSignOutCb: beforeSignOut,
    });
};

const userSettingsInitialization = () => {
    getStorageObject(ESecureStorageKey.UserSettings)
        .then((userSettings) => {
            const {theme} = userSettings;
            store.dispatch(setThemeInitialized(theme));
        })
        .catch((error) => {
            console.error(error);
            store.dispatch(setThemeInitialized(null));
        });
};

const renderNavigator = () => {
    const {
        authInitialized,
        isAuthenticated: authenticated,
        pinAuthorized: authorized,
        verificationCodeEnabled,
    } = useSelector<INtStoreState, INtAuthState>((state) => state.auth);
    const {themeInitialized} = useSelector<INtStoreState, IThemeState>((state) => state.theme);
    const {appVersionOutdated} = useSelector<INtStoreState, INtUpdateState>((state) => state.update);

    const initialized = authInitialized && themeInitialized;

    if (!initialized) {
        return <PreloadNavigator />;
    } else if (appVersionOutdated) {
        return <UpdateNavigator />;
    } else if (!authenticated) {
        return <AuthStackNavigator />;
    } else {
        if (authorized) {
            return <BottomTabNavigator />;
        } else {
            if (verificationCodeEnabled) {
                return <PinInputNavigator />;
            } else {
                return <PinCreateNavigator />;
            }
        }
    }
};

const beforeSignIn = () => {
    UserInfoStore.addDataObserver(UserInfoStore.getUserInfoDescriptor());
    DataActions.requestNuxStepPersonalSettings();
    sendMetricaEvent(MetricaEvents.LOGIN);
    sendAppsFlyerEvent(AppsFlyerEvents.LOGIN);
};

const beforeSignOut = () => {
    AppLinkService.reset();
};
