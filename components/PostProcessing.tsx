
import React from 'react';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

export const PostProcessing: React.FC = () => {
  return (
    // Fixed: disableNormalPass does not exist on EffectComposer, using enableNormalPass={false} instead as suggested by the error.
    <EffectComposer enableNormalPass={false}>
      <Bloom 
        luminanceThreshold={0.8} 
        mipmapBlur 
        intensity={1.2} 
        radius={0.4} 
      />
      <Noise opacity={0.05} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  );
};
