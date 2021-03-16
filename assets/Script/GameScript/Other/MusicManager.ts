
// const bgMusicUrl = [
//     { name: MusicConstantsDefine.BG1, url: "core/music/bg0.wav" },
// ]

// const soundEffectUrl = [
//     { name: MusicConstantsDefine.WINDOW_CLOSE, url: MusicUrlDefine.WINDOW_CLOSE },
//     { name: MusicConstantsDefine.WINDOW_OPEN, url: MusicUrlDefine.WINDOW_OPEN },
// ]

export class MusicManager {
    // 是否暂停背景音乐
    isPauseMusic: boolean = false;
    // 是否暂停音效
    isPauseEffect: boolean = false;
    private static instance: MusicManager;
    effectUrl = null;
    bgUrl = null;

    // 背景音乐音量
    musicVolume = 0.5;
    // 音效音量
    effectVolume = 0.5;

    localStorage = cc.sys.localStorage;

    constructor() {
        this.loadLocalCache();
    }

    // 加载本地缓存
    loadLocalCache() {
        this.isPauseMusic = this.localStorage.getItem("isPauseMusic") == "true" ? true : false;
        this.isPauseEffect = this.localStorage.getItem("isPauseEffect") == "true" ? true : false;

        if (this.localStorage.getItem("musicVolume")) {
            this.musicVolume = Number(this.localStorage.getItem("musicVolume"));
        }
        if (this.localStorage.getItem("effectVolume")) {
            this.effectVolume = Number(this.localStorage.getItem("effectVolume"));
        }
    }

    /**
     * 更新暂停音乐
     * @param {*} value 是否暂停
     */
    updatePauseMusic(value: boolean, isCache: boolean = true) {
        if (isCache) {
            this.isPauseMusic = value;
            //this.localStorage.setItem("isPauseMusic", this.isPauseMusic);
        }

        if (!value) {
            this.playMusic();
        } else {
            cc.audioEngine.pauseMusic();
        }
    }

    /**
     * 更新暂停音效
     * @param {*} value 是否暂停
     */
    updatePauseEffect(value: boolean) {
        this.isPauseEffect = value;
        this.localStorage.setItem("isPauseEffect", this.isPauseEffect);

        if (this.isPauseEffect) {
            cc.audioEngine.pauseAllEffects();
        }
    }

    /**
     * 更新背景音乐音量
     * @param {*} value 音量大小 0.0-1.0
     */
    updateMusicVolume(value: number) {
        this.musicVolume = value;
        this.localStorage.setItem("musicVolume", this.musicVolume);

        cc.audioEngine.setMusicVolume(this.musicVolume);
    }

    /**
     * 更新音效音量
     * @param {*} value 音量大小 0.0-1.0
     */
    updateEffectVolume(value: number) {
        this.effectVolume = value;
        this.localStorage.setItem("effectVolume", this.effectVolume);

        cc.audioEngine.setEffectsVolume(this.effectVolume);
    }

    /**
     * 播放背景音乐
     */
    playMusic(bgUrl?) {
        if (bgUrl) {
            this.bgUrl = bgUrl;
        }
        if (!this.bgUrl) {
            return;
        }

        let path = cc.path.mainFileName(this.bgUrl);

        let clip = cc.loader.getRes(path, cc.AudioClip);
        if (clip) {
            // 背景音乐循环播放
            var audioID = cc.audioEngine.playMusic(clip, true);
            this.updateMusicVolume(this.musicVolume);
        } else {
            cc.loader.loadRes(path, cc.AudioClip, (err, clip) => {
                if (err) {
                    cc.log("加载背景音乐失败: ", err);
                    return;
                }
                // 背景音乐循环播放
                var audioID = cc.audioEngine.playMusic(clip, true);
                this.updateMusicVolume(this.musicVolume);
            });
        }
    }

    /**
     * 播放音效
     */
    playEffect(effectUrl) {
        if (effectUrl) {
            this.effectUrl = effectUrl;
        }

        if (!this.effectUrl || this.isPauseEffect) {
            return;
        }

        let path = cc.path.mainFileName(this.effectUrl);
        let clip = cc.loader.getRes(path, cc.AudioClip);
        if (clip) {
            var audioID = cc.audioEngine.playEffect(clip, false);
            this.updateEffectVolume(this.effectVolume);
        } else {
            cc.loader.loadRes(path, cc.AudioClip, (err, clip1) => {
                if (err) {
                    cc.log("加载音效失败: ", err);
                    return;
                }
                var audioID = cc.audioEngine.playEffect(clip1, false);
                this.updateEffectVolume(this.effectVolume);
            });
        }
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new MusicManager();
        }
        return this.instance;
    }
}