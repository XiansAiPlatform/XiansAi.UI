import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterSelection from './RegisterSelection';
import RegisterJoin from './RegisterJoin';
import RegisterNew from './RegisterNew';

export default function Register() {
  return (
    <Routes>
      <Route index element={<RegisterSelection />} />
      <Route path="join" element={<RegisterJoin />} />
      <Route path="new" element={<RegisterNew />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}