import { TabBar } from "wabi";

const noop = () => {};

/** 홈 탭이 선택된 상태. 선택된 탭만 아이콘이 채워지고 라벨이 굵어진다. */
export function HomeActive() {
  return (
    <div style={{ width: 360 }}>
      <TabBar active="home" onSelect={noop} />
    </div>
  );
}

/** 할 일 탭. 네 탭은 항상 같은 자리에 고정되어 화면이 바뀌어도 위치가 흔들리지 않는다. */
export function TasksActive() {
  return (
    <div style={{ width: 360 }}>
      <TabBar active="tasks" onSelect={noop} />
    </div>
  );
}

/** 나 탭. 마지막 탭만 아이콘 모서리가 원형이다. */
export function MeActive() {
  return (
    <div style={{ width: 360 }}>
      <TabBar active="me" onSelect={noop} />
    </div>
  );
}
