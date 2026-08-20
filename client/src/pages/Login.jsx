import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AccessInput from '../components/AccessInput';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();

  const handleVerified = useCallback(
    (role, accessCode) => {
      sessionStorage.setItem('accessCode', accessCode);
      sessionStorage.setItem('role', role);
      navigate('/tracker');
    },
    [navigate]
  );

  return (
    <div className={styles.page}>
      <div className={styles.inputContainer}>
        <AccessInput onVerified={handleVerified} />
      </div>
    </div>
  );
}
