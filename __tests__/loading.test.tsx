import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Loading } from '../app/components/ui/loading';

describe('Loading', () => {
  it('renders a spinner (svg) inside the container', () => {
    const { container } = render(<Loading />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
