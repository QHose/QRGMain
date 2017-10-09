// Definition of the RaceDB collection

import { Mongo } from 'meteor/mongo';

export const RaceDB = new Mongo.Collection('RaceDB');
export const StopWatch = new Mongo.Collection('StopWatch');

export const WinnerRace = new Mongo.Collection('WinnerRace');
export const EnginePower = new Mongo.Collection('EnginePower');
export const Players = new Mongo.Collection('Players');
export const Teams = new Mongo.Collection('Teams');
