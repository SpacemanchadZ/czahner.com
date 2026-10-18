import '../styles/site.css';
import '../styles/tool.css';
import '../tools/job-plan/job-plan.css';
import { mount } from '../lib/mount';
import { JobPlanBuilder } from '../tools/job-plan/App';

mount(<JobPlanBuilder />);
