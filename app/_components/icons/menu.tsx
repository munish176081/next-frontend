export const MenuIcon: React.FC<{
    width?: string;
    height?: string;
  }> = ({ width, height }) => {
    return (
        <svg
        width={width || 30}
        height={height || 30}
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 9H23.4979"
          stroke="#141B34"
          strokeWidth="1.87478"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 15.2495H23.4979"
          stroke="#141B34"
          strokeWidth="1.87478"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 21.4985H23.4979"
          stroke="#141B34"
          strokeWidth="1.87478"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
  
  
    );
  };
  