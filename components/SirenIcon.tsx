
import React from 'react';

const SirenIcon: React.FC = () => (
    <div className="ml-2 w-5 h-5 relative">
        <style>
            {`
                @keyframes siren-flash {
                    0%, 100% { 
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.3;
                        transform: scale(1.3);
                    }
                }
                .siren-animation {
                    animation: siren-flash 1s infinite;
                }
            `}
        </style>
        <svg className="w-full h-full text-red-500 siren-animation" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2a6 6 0 00-6 6c0 1.888-.483 3.142-1.222 4.01A1 1 0 003.5 14h13a1 1 0 00.722-1.71C16.483 11.142 16 9.888 16 8a6 6 0 00-6-6zm-4.382 9h8.764a17.46 17.46 0 00.418-1.054c.28-.703.4-1.423.4-2.146a4 4 0 10-8 0c0 .723.12 1.443.4 2.146.131.33.268.67.418 1.054z" />
            <path fillRule="evenodd" d="M10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1z" clipRule="evenodd" />
        </svg>
    </div>
);

export default SirenIcon;