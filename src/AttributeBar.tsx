import React from 'react';
import './AttributeBar.css';

interface AttributeBarProps {
    label: string;
    value: number;
}

export const AttributeBar: React.FC<AttributeBarProps> = ({ label, value }) => {
    return (
        <div className="attribute-bar">
            <span>{label}</span>
            <div className="bar">
                <div className="value" style={{ width: `${value * 20}%` }}>
                    <span className="value-text">{value.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};
