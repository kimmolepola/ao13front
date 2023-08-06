import * as THREE from "three";
import { useSetRecoilState } from "recoil";

import * as networkingHooks from "src/networking/hooks";
import * as parameters from "src/parameters";
import * as globals from "src/globals";
import * as atoms from "src/atoms";
import * as types from "src/types";
import * as commonLogic from "src/Game/Common/logic";
import * as logic from "../../logic";

const v = new THREE.Vector3();
const v2 = new THREE.Vector3();
let nextSendTime = Date.now();
let nextScoreTime = Date.now();
const scoreTimeInteval = 9875;

export const useFrame = (camera: THREE.PerspectiveCamera) => {
  const setScore = useSetRecoilState(atoms.score);
  const { sendUnordered } = networkingHooks.useSendFromMain();

  const runFrame = (delta: number) => {
    const updateData: { [id: string]: types.UpdateObject } = {};
    for (let i = globals.objects.length - 1; i > -1; i--) {
      const o = globals.objects[i];
      if (o && o.object3D) {
        if (o.isMe) {
          commonLogic.handleKeys(delta, o);
          commonLogic.handleCamera(camera, o, o.object3D);
          commonLogic.handleInfoBoxElement(o, o.object3D);
        }
        commonLogic.handleMovement(delta, o, o.object3D);
        if (Date.now() > nextSendTime) {
          logic.gatherUpdateData(updateData, o);
          commonLogic.resetControlValues(o);
        }
        commonLogic.handleInfoElement(o, v, v2, o.object3D, camera);
        // mock
        if (Date.now() > nextScoreTime) {
          nextScoreTime = Date.now() + scoreTimeInteval;
          o.score += 1;
          setScore(o.score);
        }
      }
    }
    if (Date.now() > nextSendTime) {
      nextSendTime = Date.now() + parameters.sendIntervalMain;
      sendUnordered({
        timestamp: Date.now(),
        type: types.NetDataType.UPDATE,
        data: updateData,
      });
    }
  };
  return { runFrame };
};
