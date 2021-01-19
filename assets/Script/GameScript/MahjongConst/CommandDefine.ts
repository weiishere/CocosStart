export enum CommandDefine {
    /**检查登录状态 */
    /**打开GatePanel */
    InitGatePanel = "InitGatePanel",
    GateCommand = "GateCommand",
    StartUp = "StartUp",
    AudioCommand = "AudioCommand",
    WebSocketReconnect = "WebSocketReconnect",
    CheckLoginState = "CheckLoginState",
    OpenLoginPanel = "OpenLoginPanel",
    ShowHeaderPanel = "ShowHeaderPanel",
    OpenToast = "OpenToast",
    OpenDeskList = "OpenDeskList",
    /** 更新玩家金币 */
    UpdatePlayerGold = "UpdatePlayerGold",
    OpenPromptWindow = "OpenPromptWindow",
    InitGateMainPanel = "InitGateMainPanel",
    CloseLoginPanel = "CloseLoginPanel",
    OpenSetting = "OpenSetting",
    OpenExchangePanel = "OpenExchangePanel",
    OpenRecordPanel = "OpenRecordPanel",
    OpenRecordAlter = "OpenRecordAlter",
    ChangeUser = "ChangeUser",
    //牌桌
    /**更新玩家信息 */
    RefreshPlayerPush = "RefreshPlayer",
    /**初始化牌桌 */
    InitDeskPanel = "InitDeskPanel",
    /**发牌 */
    LicensingCardPush = "LicensingCardPush",
    /**摸牌 */
    GetGameCardPush = "GetGameCardPush",
    ExitDeskPanel = "ExitDeskPanel",
    ShowCardPush = "ShowCardPush",
    ShowCard = "ShowCard",
    ShowCardNotificationPush = "ShowCardNotificationPush",
    ShowMyEventPush = "ShowMyEventPush",
    EventDonePush = "EventDonePush",
    ShowCenterEffect = "ShowCenterEffect",
    ReStartGamePush = 'ReStartGamePush'
}