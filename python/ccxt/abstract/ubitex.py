from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_dashboard_pairlist = publicGetApiDashboardPairList = Entry('api/dashboard/PairList', 'public', 'GET', {'cost': 1})
    public_get_api_chart_history = publicGetApiChartHistory = Entry('api/chart/history', 'public', 'GET', {'cost': 1})
    public_get_api_dashboard = publicGetApiDashboard = Entry('api/dashboard', 'public', 'GET', {'cost': 1})
