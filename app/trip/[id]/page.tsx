import React from 'react';

interface TripProps {
    params: { id: string };
}

export default function TripPage({ params }: TripProps) {
    return <div>Trip ID: {params.id}</div>;
}