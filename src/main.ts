import { mountTraining } from './ui/trainingPage';
import './style.css';
import { mountManagement } from './ui/managementPages';
function boot() {
  if (location.pathname === '/treino') {
    mountTraining();
    return;
  }
  if (location.pathname === '/elenco' || location.pathname === '/config') {
    mountManagement(location.pathname);
    return;
  }
  void import('./gamePage');
}
boot();
