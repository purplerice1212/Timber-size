export const CUSTOM_BIN_PROFILE_ID = 'custom';

export const binHeightProfiles = [
  {id: 'small', label: 'Trofast Small (~95 mm)', height: 95},
  {id: 'medium', label: 'Trofast Medium (~145 mm)', height: 145},
  {id: 'large', label: 'Trofast Large (~240 mm)', height: 240}
];

export function findBinHeightProfile(id){
  if(typeof id !== 'string') return undefined;
  return binHeightProfiles.find(profile => profile.id === id);
}
