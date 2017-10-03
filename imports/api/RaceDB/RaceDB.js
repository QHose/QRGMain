// Definition of the RaceDB collection

import { Mongo } from 'meteor/mongo';

export const RaceDB = new Mongo.Collection('RaceDB');
export const StopWatch = new Mongo.Collection('StopWatch');