import { useCallback } from "react";
import * as THREE from "three";
import * as hooks from "..";
import * as types from "src/types";
import * as globals from "src/globals";

export const useLocalLoader = (scene: THREE.Scene) => {
  const { loadBackground, loadBullet } = hooks.useMeshes();

  const loadMesh = useCallback(
    async (meshLoadFn: () => Promise<THREE.Mesh>) => {
      const mesh = await meshLoadFn();
      scene.add(mesh);
      return mesh;
    },
    [scene]
  );

  const load = useCallback(
    (meshName: types.Meshes) => {
      switch (meshName) {
        case "bullet":
          return loadMesh(loadBullet);
        case "background":
          return loadMesh(loadBackground);
        default:
          break;
      }
    },
    [loadMesh, loadBullet, loadBackground]
  );

  const remove = useCallback(
    (objectsIndex: number) => {
      const os = globals.localObjects;
      const o = os[objectsIndex];
      if (o.object3d) {
        scene.remove(o.object3d);
      }
      os.splice(objectsIndex, 1);
    },
    [scene]
  );

  return { load, remove };
};
