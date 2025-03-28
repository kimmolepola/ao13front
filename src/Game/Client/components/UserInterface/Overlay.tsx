import { RefObject, memo } from "react";
import { useRecoilValue } from "recoil";

import {
  ConnectingBox as ConnectingBoxDiv,
  InfoBox,
  InfoText,
  ControlButtons,
  RadarBox,
} from "src/Game/Common/components/UserInterface/Overlay";
import * as globals from "src/globals";
import * as atoms from "src/atoms";

const InfoTexts = () => (
  <>
    {globals.remoteObjects.reduce((acc: JSX.Element[], cur) => {
      acc.push(<InfoText key={cur.id} gameObject={cur} />);
      return acc;
    }, [])}
  </>
);

const ConnectingBox = ({ visible }: { visible: boolean }) =>
  visible ? <ConnectingBoxDiv /> : null;

const CanvasOverlay = ({
  style,
  infoBoxRef,
  radarBoxRef,
}: {
  style: Object;
  infoBoxRef: RefObject<HTMLDivElement>;
  radarBoxRef: RefObject<{ [id: string]: RefObject<HTMLDivElement> }>;
}) => {
  useRecoilValue(atoms.objectIds); // rerender when objectIds change
  const isConnected = Boolean(useRecoilValue(atoms.connectedAmount));

  return (
    <div className="absolute inset-0 z-1" style={style}>
      <InfoTexts />
      <ConnectingBox visible={!isConnected} />
      {isConnected && <InfoBox infoBoxRef={infoBoxRef} />}
      <ControlButtons />
      <RadarBox radarBoxRef={radarBoxRef} />
    </div>
  );
};

export default memo(CanvasOverlay);
