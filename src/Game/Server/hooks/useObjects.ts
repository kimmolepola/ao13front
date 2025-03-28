import { useEffect, useCallback } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import * as THREE from "three";

import {
  saveGameState,
  getGameObject,
} from "src/networking/services/gameObject.service";
import * as networkingHooks from "src/networking/hooks";
import * as globals from "src/globals";

import * as parameters from "src/parameters";
import * as atoms from "src/atoms";
import * as types from "src/types";

const addObject = async (id: string) => {
  if (!globals.remoteObjects.some((x) => x.id === id)) {
    const initialGameObject = (await getGameObject(id)).data;
    if (initialGameObject) {
      const gameObject = {
        ...initialGameObject,
        id,
        isMe: id === globals.state.ownId,
        type: types.GameObjectType.FIGHTER as types.GameObjectType.FIGHTER,
        controlsUp: 0,
        controlsDown: 0,
        controlsLeft: 0,
        controlsRight: 0,
        controlsSpace: 0,
        controlsOverChannelsUp: 0,
        controlsOverChannelsDown: 0,
        controlsOverChannelsLeft: 0,
        controlsOverChannelsRight: 0,
        controlsOverChannelsSpace: 0,
        rotationSpeed: 0,
        speed: parameters.speed,
        backendPosition: new THREE.Vector3(),
        backendQuaternion: new THREE.Quaternion(),
        keyDowns: [],
        infoElement: {
          containerRef: undefined,
          row1Ref: undefined,
          row2Ref: undefined,
        },
        infoBoxElement: undefined,
        object3d: undefined,
        dimensions: undefined,
        shotDelay: 0,
        collisions: {},
        health: 100,
      };
      globals.remoteObjects.push(gameObject);
    } else {
      console.error("Failed to add new object, no initialGameObject");
    }
  }
  return globals.remoteObjects.map((x) => x.id);
};

const savePlayerData = async () => {
  const data =
    globals.remoteObjects.reduce((acc: types.PlayerState[], cur) => {
      if (cur.isPlayer) {
        acc.push({ remoteId: cur.id, score: cur.score });
      }
      return acc;
    }, []) || [];
  await saveGameState(data);
};

const handleSendState = (sendOrdered: (data: types.State) => void) => {
  sendOrdered({
    type: types.NetDataType.STATE,
    data: globals.remoteObjects.reduce(
      (acc: { [id: string]: types.StateObject }, cur) => {
        acc[cur.id] = {
          sId: cur.id,
          sIsPlayer: cur.isPlayer,
          sUsername: cur.username,
          sScore: cur.score,
          sRotationSpeed: cur.rotationSpeed,
          sSpeed: cur.speed,
          sPositionX: cur.object3d?.position.x || 0,
          sPositionY: cur.object3d?.position.y || 0,
          sPositionZ: cur.object3d?.position.z || 0,
          sQuaternionX: cur.object3d?.quaternion.x || 0,
          sQuaternionY: cur.object3d?.quaternion.y || 0,
          sQuaternionZ: cur.object3d?.quaternion.z || 0,
          sQuaternionW: cur.object3d?.quaternion.w || 0,
        };
        return acc;
      },
      {}
    ),
  });
};

export const useObjects = (startInterval?: boolean) => {
  const main = useRecoilValue(atoms.main);
  const setObjectIds = useSetRecoilState(atoms.objectIds);
  const { sendOrdered } = networkingHooks.useSendFromMain();

  const handleNewId = useCallback(
    async (newId: string) => {
      const ids = await addObject(newId);
      setObjectIds(ids);
      handleSendState(sendOrdered);
    },
    [setObjectIds, sendOrdered]
  );

  const handleRemoveId = useCallback(
    (idToRemove: string) => {
      savePlayerData();
      const indexToRemove = globals.remoteObjects.findIndex(
        (x) => x.id === idToRemove
      );
      indexToRemove !== -1 && globals.remoteObjects.splice(indexToRemove, 1);
      const ids = globals.remoteObjects.map((x) => x.id);
      setObjectIds(ids);
      handleSendState(sendOrdered);
    },
    [setObjectIds, sendOrdered]
  );

  useEffect(() => {
    // main change
    let sendMainStateIntervalId = 0;
    let savePlayerDataIntervalId = 0;
    if (main && startInterval) {
      sendMainStateIntervalId = window.setInterval(() => {
        handleSendState(sendOrdered);
      }, parameters.sendIntervalMainState);
      savePlayerDataIntervalId = window.setInterval(() => {
        savePlayerData();
      }, parameters.savePlayerDataInterval);
    }
    return () => {
      clearInterval(sendMainStateIntervalId);
      clearInterval(savePlayerDataIntervalId);
    };
  }, [main, startInterval, sendOrdered]);

  const handleQuitForObjects = useCallback(async () => {
    await savePlayerData();
    globals.remoteObjects.splice(0, globals.remoteObjects.length);
    setObjectIds([]);
  }, [setObjectIds]);

  const handleReceiveControlsData = useCallback(
    (data: types.Controls, remoteId: string) => {
      const o = globals.remoteObjects.find((x) => x.id === remoteId);
      if (o) {
        o.controlsUp += data.data.up || 0;
        o.controlsDown += data.data.down || 0;
        o.controlsLeft += data.data.left || 0;
        o.controlsRight += data.data.right || 0;
        o.controlsSpace += data.data.space || 0;
        o.controlsOverChannelsUp += data.data.up || 0;
        o.controlsOverChannelsDown += data.data.down || 0;
        o.controlsOverChannelsLeft += data.data.left || 0;
        o.controlsOverChannelsRight += data.data.right || 0;
        o.controlsOverChannelsSpace += data.data.space || 0;
      }
    },
    []
  );

  return {
    handleNewId,
    handleRemoveId,
    handleQuitForObjects,
    handleReceiveControlsData,
  };
};
