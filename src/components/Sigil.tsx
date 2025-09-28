// seasonal special
import React from 'react';
import './Sigil.css';
import { Sigil as SigilType } from '../models/model';

interface SigilProps {
    sigil: SigilType;
}

const Sigil: React.FC<SigilProps> = ({ sigil }) => {
  return (
    <div className="sigil">
        <img 
            src={`${process.env.PUBLIC_URL}/images/sigils/${sigil.category}/${sigil.name}.png`} 
            alt={sigil.name} 
            className="sigil-image"
        />
        <div className="sigil-name">{sigil.name}</div>
    </div>
  );
};

export default Sigil;