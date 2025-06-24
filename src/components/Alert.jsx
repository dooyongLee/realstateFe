import React from 'react';
import Modal from './Modal'; // Reusing the existing Modal component
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import styles from './Alert.module.css';

const ICONS = {
  success: <FaCheckCircle className={`${styles.icon} ${styles.success}`} />,
  error: <FaTimesCircle className={`${styles.icon} ${styles.error}`} />,
  warning: <FaExclamationTriangle className={`${styles.icon} ${styles.warning}`} />,
  info: <FaInfoCircle className={`${styles.icon} ${styles.info}`} />,
};

const TITLES = {
  success: '성공적으로 처리되었습니다.',
  error: '오류가 발생했습니다.',
  warning: '확인이 필요합니다.',
  info: '알림',
}

const Alert = ({ isOpen, message, type = 'info', onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} hasAnimation={true}>
      <div className={styles.customAlert}>
        <div className={styles.iconContainer}>
          {ICONS[type]}
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{TITLES[type]}</h3>
          <p className={styles.message}>{message}</p>
        </div>
        <div className={styles.footer}>
          <button className="btn btn-primary" onClick={onClose}>확인</button>
        </div>
      </div>
    </Modal>
  );
};

export default Alert; 