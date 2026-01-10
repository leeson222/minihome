let loginBgm;
let mainBgm;
let clickSfx;

const safePlay = async (audio) => {
  try {
    if (!audio) return;
    await audio.play();
  } catch (e) {
    // 자동재생 제한으로 막히는 경우 있음 (클릭 이후엔 대부분 OK)
    console.log("Audio play blocked:", e?.message);
  }
};

export const audio = {
  init() {
    if (loginBgm) return;

    loginBgm = new Audio("/audio/login-bgm.mp3");
    loginBgm.loop = true;
    loginBgm.volume = 0.35;

    mainBgm = new Audio("/audio/main-bgm.mp3");
    mainBgm.loop = true;
    mainBgm.volume = 0.35;

    clickSfx = new Audio("/audio/click.mp3");
    clickSfx.loop = false;
    clickSfx.volume = 0.7;
  },

  async playLoginBgm() {
    this.init();
    this.stopMainBgm();
  
    // ✅ 항상 처음부터
    loginBgm.currentTime = 0;
  
    await safePlay(loginBgm);
  },

  async playMainBgm() {
    this.init();
    this.stopLoginBgm();
  
    // ✅ 항상 처음부터
    mainBgm.currentTime = 0;
  
    await safePlay(mainBgm);
  },

  stopLoginBgm() {
    if (!loginBgm) return;
    loginBgm.pause();
    loginBgm.currentTime = 0; // ✅ 멈출 때도 초기화
  },
  
  stopMainBgm() {
    if (!mainBgm) return;
    mainBgm.pause();
    mainBgm.currentTime = 0; // ✅ 멈출 때도 초기화
  },

  click() {
    this.init();
    // 연타해도 매번 들리게
    clickSfx.currentTime = 0;
    clickSfx.play().catch(() => {});
  },
};