import { Route, HashRouter } from '@solidjs/router';
import LandingPage from '@/pages/landing/LandingPage';
import StudioPage from '@/pages/studio/StudioPage';
import NotFoundPage from '@/pages/not-found/NotFoundPage';

export default function App() {
  console.log("note")
  return (
    <HashRouter>
      <Route path="/" component={LandingPage} />
      <Route path="/studio" component={StudioPage} />
      <Route path="*" component={NotFoundPage} />
    </HashRouter>
  );
}
