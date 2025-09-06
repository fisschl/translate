'use client';

import { MainLayout } from '../components/layout/main-layout';
import { TranslationPanel } from '../components/translation/translation-panel';

export default function Home() {
  return (
    <MainLayout>
      <TranslationPanel />
    </MainLayout>
  );
}
