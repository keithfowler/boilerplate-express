import { container } from './ioc/iocConfig';
import { BootStrapper } from './loaders/bootstrapper';

const bootstrapper = container.get<BootStrapper>(BootStrapper);

bootstrapper.execute();