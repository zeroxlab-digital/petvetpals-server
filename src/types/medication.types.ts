import { Document, Types } from "mongoose";

export interface IMedication {
  toObject(): IMedication;
  _id: Types.ObjectId;
  pet: Types.ObjectId
  medication: string;
  dosage?: string;
  frequency: string;
  remaining: number;
  start_date: Date;
  end_date?: Date;
  is_ongoing: boolean;
  time_of_day?: string | null;
  next_due?: Date | null;
  instructions?: string | null;
}


export interface IReminderTime {
  time: string;
  remind_before: "0" | "5" | "10" | "15" | "30" | "60";
  last_reset?: Date | null;
  is_given: boolean;
  last_notified?: Date | null;
  skipped: boolean;
}

export interface IMedicationReminder {
  _id?: Types.ObjectId;

  user: Types.ObjectId;
  pet: Types.ObjectId;
  medication: IMedication;

  frequency?: string;

  starting_date: Date;
  end_date?: Date | null;

  reminder_times: IReminderTime[];

  reminder_methods?: ("push" | "in-app")[];

  repeat_reminder: boolean;
}