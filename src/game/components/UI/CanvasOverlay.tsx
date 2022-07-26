import {
  memo, useMemo, useCallback, RefObject, useEffect,
} from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import theme from '../../../themets.js';
import { handlePressed, handleReleased } from '../../controls';

import * as atoms from '../../../atoms';
import * as types from '../../../types';

const Connecting = styled.div<any>`
  position: absolute;
  top: max(calc(50% - 75px), 0px);
  right: max(calc(50% - 150px), 0px);
  bottom: max(calc(50% - 75px), 0px);
  left: max(calc(50% - 150px), 0px);
  background: ${theme.colors.bgVerylight};
  display: ${(props) => (props.show ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  transition: transform 3s;
`;

const InfoBoxElement = styled.div<{ show: boolean, ref: (ref: HTMLDivElement) => void }>`
  display: ${(props) => (props.show ? '' : 'none')};
  padding: 5px;
  background: rgba(255, 255, 255, 0.75);
  white-space: pre-line;
  position: absolute;
  left: 20px;
  top: 20px;
  font-family: ${theme.fontFamily};
  font-size: 12px;
`;

const ControlsContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  @media (min-width: ${theme.mobileWidth}px) {
    display: none;
  }
`;

const Controls = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Button = styled.button`
  padding: 0px;
  display: flex;
  opacity: 85%;
  color: ${theme.colors.highlight1};
  border-color: ${theme.colors.highlight1};
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border-radius: 50%;
  border-width: 3px;
  margin: 2mm 7mm 4mm 7mm;
  width: 1cm;
  height: 1cm;
  background: transparent;
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Likely future */
`;

const Container = styled.div<any>`
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: min(
    ${theme.sidepanelMaxWidth},
    ${(props) => (props.windowHeight / 100) * theme.sidepanelWidthPercent}px
  );
  left: 0px;
  @media (min-width: ${theme.mobileWidth}px) {
    right: min(${theme.sidepanelMaxWidth}, ${theme.sidepanelWidthPercent}vw);
    bottom: 0px;
  }
  display: flex;
`;

const InfoElement = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  transition: all 0.02s;
  font-family: ${theme.fontFamily};
  font-size: 11px;
  color: white;
`;

const InfoElements = ({ objectsRef }: { objectsRef: RefObject<types.GameObject[]> }) => {
  const ownId = useRecoilValue(atoms.ownId);

  return (
    <>
      {Object.entries(objectsRef.current || []).reduce((acc: any, [id, object]) => {
        const o = object;
        if (id !== ownId) {
          acc.push(
            <InfoElement
              key={id}
              ref={(element) => {
                o.infoElement = element;
              }}
            />,
          );
        }
        return acc;
      }, [])}
    </>
  );
};

const ControlButton = ({
  control,
  objectsRef,
}: {
  control: types.Keys,
  objectsRef: RefObject<types.GameObject[]>,
}) => {
  const ownId = useRecoilValue(atoms.ownId);

  const onPressed = useCallback(() => {
    handlePressed(control, ownId, objectsRef);
  }, [control, ownId, objectsRef]);

  const onReleased = useCallback(() => {
    handleReleased(control, ownId, objectsRef);
  }, [control, ownId, objectsRef]);

  const symbol = useMemo(() => {
    switch (control) {
      case types.Keys.UP:
        return '\u2191';
      case types.Keys.DOWN:
        return '\u2193';
      case types.Keys.LEFT:
        return '\u2190';
      case types.Keys.RIGHT:
        return '\u2192';
      default:
        return null;
    }
  }, [control]);

  return (
    <Button
      onTouchStart={onPressed}
      onTouchEnd={onReleased}
      onMouseDown={onPressed}
      onMouseUp={onReleased}
    >
      {symbol}
    </Button>
  );
};

const CanvasOverlay = ({ objectsRef }: { objectsRef: RefObject<types.GameObject[]> }) => {
  console.log('--CanvasOverlay');

  const windowHeight = useRecoilValue(atoms.windowHeight);
  //  const connectedIds = useRecoilValue(atoms.connectedIdsOnMain);
  const channelsOrdered = useRecoilValue(atoms.channelsOrdered);
  const channelsUnordered = useRecoilValue(atoms.channelsUnordered);
  const objectIds = useRecoilValue(atoms.objectIds);
  const main = useRecoilValue(atoms.main);
  const ownId = useRecoilValue(atoms.ownId);

  useEffect(() => {
    // re-render after updated objectsRef.current
  }, [objectIds]);

  return (
    <Container windowHeight={windowHeight}>
      <InfoElements objectsRef={objectsRef} />
      <Connecting show={!main && (!channelsOrdered.length || !channelsUnordered.length)}>Connecting...</Connecting>
      <InfoBoxElement
        show={Boolean(main || (channelsOrdered.length && channelsUnordered.length))}
        ref={(element: HTMLDivElement) => {
          const ownObject = objectsRef.current?.find((x) => x.id === ownId);
          if (ownObject) {
            ownObject.infoBoxElement = element;
          }
        }}
      />
      <ControlsContainer>
        <Controls>
          <ControlButton control={types.Keys.LEFT} objectsRef={objectsRef} />
          <ButtonGroup>
            <ControlButton control={types.Keys.UP} objectsRef={objectsRef} />
            <ControlButton control={types.Keys.DOWN} objectsRef={objectsRef} />
          </ButtonGroup>
          <ControlButton control={types.Keys.RIGHT} objectsRef={objectsRef} />
        </Controls>
      </ControlsContainer>
    </Container>
  );
};

export default memo(CanvasOverlay);
