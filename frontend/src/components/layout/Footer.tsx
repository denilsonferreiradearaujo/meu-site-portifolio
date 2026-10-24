import React from 'react';

interface FooterProps {
  name: string;
}

export const Footer: React.FC<FooterProps> = ({ name }) => {
  return (
    <footer className="footer" id="footer">
      © {new Date().getFullYear()} {name}
    </footer>
  );
};
