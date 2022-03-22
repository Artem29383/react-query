import {CommonActions} from '@react-navigation/native';
import {Store} from 'redux';

import {OverlayNavigation} from '@src/common/navigation/navigators/overlay';
import {overlayHide, overlayShow} from '@src/common/store/actions/overlay';
import {ICommonStoreState} from '@src/common/store/store';
import {NavigationLogger} from '../../../common/utils/logger/navigation';
import {AlertNavigation} from '@src/common/navigation/navigators/alert';

export class Navigation<RouteKey extends string> {
    public readonly overlayNavigation: OverlayNavigation<RouteKey>;
    public readonly alertNavigation: AlertNavigation<RouteKey>;

    private navigator;
    private readonly store: Store;

    public constructor(store: Store) {
        this.store = store;
        this.overlayNavigation = new OverlayNavigation<RouteKey>();
        this.alertNavigation = new AlertNavigation<RouteKey>();
    }

    public setTopLevelNavigator = (navigatorRef) => {
        this.navigator = navigatorRef;
    };

    public getTopLevelNavigator = () => {
        return this.navigator;
    };

    public navigate = (routeName: RouteKey, params?) => {
        NavigationLogger.log('navigationGoTo', routeName, params || {});

        if (this.isOverlayRoute(routeName)) {
            this.overlayShow(routeName, params);
            return;
        }

        const currentState: ICommonStoreState = this.store.getState();

        if (currentState.overlay.route) {
            this.overlayHide();
        }
        this.navigator.dispatch(CommonActions.navigate(routeName, params));
    };

    public setParamsNavigate = (params) => {
        const currentState: ICommonStoreState = this.store.getState();

        if (currentState.overlay.route) {
            this.overlayHide();
        }
        this.navigator.dispatch(CommonActions.setParams(params));
    };

    public back = (routeName?: RouteKey) => {
        NavigationLogger.log('navigationGoBack', 'navigationGoBack', {key: routeName || {}});

        if (this.store.getState().overlay.route) {
            this.overlayHide();
            if (!routeName || Object.keys(this.overlayNavigation.getOverLayRoutes()).includes(routeName)) {
                return;
            }
        }

        this.navigator.dispatch(CommonActions.goBack());
    };

    private isOverlayRoute = (routeName: string) => {
        return this.overlayNavigation.getOverLayRoutes()[routeName];
    };

    private overlayShow = (routeName, options: any = {}) => {
        this.store.dispatch(
            overlayShow({
                componentProps: options.props || {},
                route: routeName,
            }),
        );
    };

    private overlayHide = () => {
        this.store.dispatch(overlayHide());
    };
}
