import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Job extends Document {
  @Prop({ required: true })
  job_id: string;

  @Prop()
  d_api_description?: string;

  @Prop()
  d_cid?: string;

  @Prop()
  d_zid?: string;

  @Prop()
  d_fn_name?: string;

  @Prop()
  d_sdhm_endpoint_src?: string;

  @Prop({ required: true })
  d_endpoint: string;

  @Prop({ required: true })
  d_invocation_method: string;

  @Prop()
  d_schedule_type?: string;

  @Prop()
  d_timeout_in_sec?: number;

  @Prop()
  d_get_param?: string;

  @Prop({ type: Object, default: {} })
  d_post_put_param?: Record<string, any>;

  @Prop()
  d_token?: string;

  @Prop()
  d_immediate_next_run_code?: number;

  @Prop()
  conf_inuse?: boolean;

  @Prop()
  rpt_next_run_ts?: Date;

  @Prop()
  rpt_running_status?: string;

  @Prop()
  job_bean?: string;

  @Prop({ default: 0 })
  rpt_running_count?: number;

  @Prop()
  rpt_expected_timeout_ts?: Date;

  @Prop()
  rpt_last_run_duration?: number;

  @Prop()
  rpt_last_update_endpoint?: Date;

  @Prop()
  rpt_last_run_ts?: Date;

  @Prop()
  rpt_project_instance_id?: string;

  @Prop()
  rpt_running_id?: string;

  @Prop()
  rpt_last_run_response?: string;

  @Prop()
  rpt_last_run_result?: string;

  @Prop()
  d_fix_cron?: string;
}

export const JobSchema = SchemaFactory.createForClass(Job); 