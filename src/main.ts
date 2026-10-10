import './style.css';
import { mountManagement } from './ui/managementPages';
function boot() {
  if (location.pathname === '/elenco' || location.pathname === '/config') {
    mountManagement(location.pathname);
    return;
  }
  void import('./gamePage');
}
boot();
