import {parseList} from '../utils/parse.js';

export function parserTests() {
  const fallback = [40, 283, 40];
  return [
    {name: 'parser: mm suffix', pass: parseList('40mm,283,40').join(',') === '40,283,40'},
    {name: 'parser: fallback', pass: parseList('x,y', fallback).join(',') === fallback.join(',')}
  ];
}
