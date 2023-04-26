import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import * as atoms from "../../atoms";

export const useIceServers = () => {
  const turnCredentials = useRecoilValue(atoms.turnCredentials);

  const iceServers = useMemo(
    () => (turnCredentials ? [turnCredentials] : []),
    [turnCredentials]
  );

  return { iceServers };
};
