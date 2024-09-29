import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import React, { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { useSpeech } from "../hooks/useSpeech";
import facialExpressions from "../constants/facialExpressions";
import visemesMapping from "../constants/visemesMapping";
import morphTargets from "../constants/morphTargets";

export function Avatar(props) {
  let testaudio = "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";



  const { nodes, materials, scene } = useGLTF("/models/avatar.glb");
  const { animations } = useGLTF("/models/animations.glb");
  const { message, onMessagePlayed } = useSpeech();
  const [lipsync, setLipsync] = useState();
  const [setupMode, setSetupMode] = useState(false);

  useEffect(() => {
    if (!message) {
      setAnimation("Idle");
      return;
    }
    setAnimation(message.animation);
    setFacialExpression(message.facialExpression);
    setLipsync(message.lipsync);
    const audio = new Audio("data:audio/mp3;base64," + testaudio);
    audio.play();
    setAudio(audio);
    audio.onended = onMessagePlayed;
  }, [message]);


  const group = useRef();
  const { actions, mixer } = useAnimations(animations, group);
  const [animation, setAnimation] = useState(animations.find((a) => a.name === "Idle") ? "Idle" : animations[0].name);
  useEffect(() => {
    if (actions[animation]) {
      actions[animation]
        .reset()
        .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
        .play();
      return () => {
        if (actions[animation]) {
          actions[animation].fadeOut(0.5);
        }
      };
    }
  }, [animation]);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (index === undefined || child.morphTargetInfluences[index] === undefined) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(child.morphTargetInfluences[index], value, speed);
      }
    });
  };

  const [blink, setBlink] = useState(false);
  const [facialExpression, setFacialExpression] = useState("");
  const [audio, setAudio] = useState();

  useFrame(() => {
    !setupMode &&
      morphTargets.forEach((key) => {
        const mapping = facialExpressions[facialExpression];
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        if (mapping && mapping[key]) {
          lerpMorphTarget(key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(key, 0, 0.1);
        }
      });

    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);

    if (setupMode) {
      return;
    }

    const appliedMorphTargets = [];
    if (message && lipsync) {
      const currentAudioTime = audio.currentTime;
      for (let i = 0; i < lipsync.mouthCues.length; i++) {
        const mouthCue = lipsync.mouthCues[i];
        if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
          appliedMorphTargets.push(visemesMapping[mouthCue.value]);
          lerpMorphTarget(visemesMapping[mouthCue.value], 1, 0.2);
          break;
        }
      }
    }

    Object.values(visemesMapping).forEach((value) => {
      if (appliedMorphTargets.includes(value)) {
        return;
      }
      lerpMorphTarget(value, 0, 0.1);
    });
  });

  useControls("FacialExpressions", {
    animation: {
      value: animation,
      options: animations.map((a) => a.name),
      onChange: (value) => setAnimation(value),
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: (value) => setFacialExpression(value),
    },
    setupMode: button(() => {
      setSetupMode(!setupMode);
    }),
    logMorphTargetValues: button(() => {
      const emotionValues = {};
      Object.values(nodes).forEach((node) => {
        if (node.morphTargetInfluences && node.morphTargetDictionary) {
          morphTargets.forEach((key) => {
            if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
              return;
            }
            const value = node.morphTargetInfluences[node.morphTargetDictionary[key]];
            if (value > 0.01) {
              emotionValues[key] = value;
            }
          });
        }
      });
      console.log(JSON.stringify(emotionValues, null, 2));
    }),
  });

  useControls("MorphTarget", () =>
    Object.assign(
      {},
      ...morphTargets.map((key) => {
        return {
          [key]: {
            label: key,
            value: 0,
            min: 0,
            max: 1,
            onChange: (val) => {
              lerpMorphTarget(key, val, 0.1);
            },
          },
        };
      })
    )
  );

  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} dispose={null} ref={group} position={[0, -0.5, 0]}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Glasses.geometry}
        material={materials.Wolf3D_Glasses}
        skeleton={nodes.Wolf3D_Glasses.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Headwear.geometry}
        material={materials.Wolf3D_Headwear}
        skeleton={nodes.Wolf3D_Headwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  );
}

useGLTF.preload("/models/avatar.glb");
