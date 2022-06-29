let lastH = new Date().getHours();
const display = () => {
  const date = new Date();
  const month = date.getMonth();
  const day = date.getDay();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  document.getElementsByClassName(
    "hrs"
  )[0].innerHTML = `<span>${hours[0]}</span><span>${hours[1]}</span><em>:</em><span>${minutes[0]}</span><span>${minutes[1]}</span><em>:</em><span>${seconds[0]}</span><span>${seconds[1]}</span>`;

  const ison = localStorage.getItem("switch_on") == "on";
  if (ison) {
    document.getElementById("switch").setAttribute("data-switch", "on");
    document.getElementById("logo").setAttribute("data-switch", "on");
    document.getElementById("status").innerHTML = "working";
  } else {
    document.getElementById("switch").setAttribute("data-switch", "off");
    document.getElementById("logo").setAttribute("data-switch", "off");
    document.getElementById("status").innerHTML = "off work";
  }

  const worklogs = JSON.parse(localStorage.getItem("worklogs") || "[]");
  const worklogs_html = worklogs.map((worklog) => {
    const date = new Date(worklog.date);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `<div class="worklog">${
      worklog.status == "on" ? "WORKING" : "OFF WORK"
    }<span class="date">${month}/${day} ${hours}:${minutes}:${seconds}</span></div>`;
  });
  document.getElementById("worklogs").innerHTML = worklogs_html.join("\n");
  getWorkTimeToday();
  if (chrome && chrome.i18n) {
    if (new Date().getHours() == 18 && lastH == 17) {
      lastH = new Date().getHours();
      const title = chrome.i18n.getMessage("title");
      document.title = title;
      chrome.notifications.create(null, {
        iconUrl: "logo.png", // icon url - can be relative
        title: title, // notification title
        type: "basic",
        message: "it's time to off work!", // notification body text
      });
    }
    if (new Date().getHours() == 9 && lastH == 8) {
      lastH = new Date().getHours();
      const title = chrome.i18n.getMessage("title");
      chrome.notifications.create(null, {
        iconUrl: "logo.png", // icon url - can be relative
        title: title, // notification title
        type: "basic",
        message: "it's time to start work!", // notification body text
      });
    }
  }
};
const title =
  chrome && chrome.i18n ? chrome.i18n.getMessage("title") : "霓虹工作钟";
document.title = title;
setInterval(() => {
  display();
}, 100);

document.getElementById("dot").addEventListener("click", () => {
  document
    .getElementById("switch")
    .setAttribute(
      "data-switch",
      document.getElementById("switch").getAttribute("data-switch") === "on"
        ? "off"
        : "on"
    );

  localStorage.setItem(
    "switch_on",
    document.getElementById("switch").getAttribute("data-switch") === "on"
      ? "on"
      : "off"
  );
  const workstatus =
    document.getElementById("switch").getAttribute("data-switch") === "on"
      ? "on"
      : "off";
  const worklogs = JSON.parse(localStorage.getItem("worklogs") || "[]");
  const worklog = {
    date: new Date(),
    status: workstatus,
  };
  worklogs.unshift(worklog);
  localStorage.setItem("worklogs", JSON.stringify(worklogs.splice(0, 10000)));
});

function getWorkTimeToday() {
  const worklogs = JSON.parse(localStorage.getItem("worklogs") || "[]");
  const todayStartTimestamp = new Date();
  todayStartTimestamp.setHours(0, 0, 0, 0);

  const todayWorklogs = worklogs.filter((worklog) => {
    return new Date(worklog.date).getTime() > todayStartTimestamp.getTime();
  });
  if (worklogs.length != todayWorklogs.length) {
    todayWorklogs.push({
      date: todayStartTimestamp,
      status:
        todayWorklogs[todayWorklogs.length - 1].status == "on" ? "off" : "on",
    });
  }
  const nowTime = new Date().getTime();
  const logs = todayWorklogs;
  let workTime = 0;
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    if (log.status == "on") {
      const startTime = new Date(log.date).getTime();
      const endTime = i >= 1 ? new Date(logs[i - 1].date).getTime() : nowTime;
      workTime += endTime - startTime;
    }
  }

  document.getElementById("workTime").innerHTML = `${Math.floor(
    workTime / 1000 / 60 / 60
  )}h ${Math.floor((workTime / 1000 / 60) % 60)}m ${Math.floor(
    (workTime / 1000) % 60
  )}s`;
}
