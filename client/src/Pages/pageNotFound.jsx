import React, { useEffect } from 'react';

const ErrorFace = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const styles = {
    container: {
      fontFamily: 'Open Sans, sans-serif',
      margin: 0,
      padding: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#F2EEE8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.6s ease-out',
    },
    face: {
      width: '300px',
      height: '300px',
      border: '4px solid #383A41',
      borderRadius: '10px',
      backgroundColor: '#FFFFFF',
      position: 'relative',
      animation: 'bounce 2s infinite',
    },
    band: {
      width: '350px',
      height: '27px',
      border: '4px solid #383A41',
      borderRadius: '5px',
      position: 'absolute',
      top: '20px',
      left: '-25px',
    },
    stripe: {
      width: '100%',
      height: '9px',
    },
    red: { backgroundColor: '#EB6D6D' },
    white: { backgroundColor: '#FFFFFF' },
    blue: { backgroundColor: '#5E7FDC' },
    bandOverlayLeft: {
      position: 'absolute',
      height: '27px',
      width: '30px',
      backgroundColor: 'rgba(255,255,255,0.3)',
      left: 0,
      top: 0,
      zIndex: 1,
    },
    bandOverlayRight: {
      position: 'absolute',
      height: '27px',
      width: '30px',
      backgroundColor: 'rgba(56,58,65,0.3)',
      right: 0,
      top: 0,
      zIndex: 1,
    },
    eyes: {
      width: '128px',
      margin: '90px auto 0',
      display: 'flex',
      justifyContent: 'space-between',
    },
    eye: {
      width: '30px',
      height: '15px',
      border: '7px solid #383A41',
      borderTopLeftRadius: '22px',
      borderTopRightRadius: '22px',
      borderBottom: '0',
      animation: 'blink 3s infinite',
    },
    dimples: {
      width: '180px',
      margin: '20px auto 0',
      display: 'flex',
      justifyContent: 'space-between',
    },
    dimple: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: 'rgba(235,109,109,0.4)',
      animation: 'dimplePulse 2s infinite ease-in-out',
    },
    mouth: {
      width: '40px',
      height: '5px',
      borderRadius: '5px',
      backgroundColor: '#383A41',
      margin: '25px auto 0',
      animation: 'mouthDrop 2s infinite ease-in-out',
    },
    heading: {
      fontWeight: 800,
      color: '#383A41',
      fontSize: '2.5em',
      marginTop: '30px',
      animation: 'fadeSlideDown 1s ease',
    },
    button: {
      fontFamily: 'Open Sans, sans-serif',
      fontWeight: 400,
      padding: '15px 30px',
      backgroundColor: '#5E7FDC',
      color: 'white',
      marginTop: '40px',
      fontSize: '1.2em',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background 0.3s ease',
      animation: 'pulse 2s infinite',
    },
  };

  return (
    <>
      <style>
        {`
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }

        @keyframes mouthDrop {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }

        @keyframes dimplePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeSlideDown {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.face}>
          <div style={styles.band}>
            <div style={{ ...styles.stripe, ...styles.red }} />
            <div style={{ ...styles.stripe, ...styles.white }} />
            <div style={{ ...styles.stripe, ...styles.blue }} />
            <div style={styles.bandOverlayLeft}></div>
            <div style={styles.bandOverlayRight}></div>
          </div>

          <div style={styles.eyes}>
            <div style={styles.eye}></div>
            <div style={styles.eye}></div>
          </div>

          <div style={styles.dimples}>
            <div style={styles.dimple}></div>
            <div style={styles.dimple}></div>
          </div>

          <div style={styles.mouth}></div>
        </div>

        <h1 style={styles.heading}>Records Not Found!</h1>

        <div
          style={styles.button}
          onClick={() => window.location.href = '/'}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(94, 127, 220, 0.8)'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#5E7FDC'}
        >
          Return to Home
        </div>
      </div>
    </>
  );
};

export default ErrorFace;
