import './Loading.css';

const Loading = ({ fullPage = false }) => {
  return (
    <div className={`loading-container ${fullPage ? 'full-page' : ''}`}>
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default Loading;