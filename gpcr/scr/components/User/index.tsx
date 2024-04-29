import React from 'react';

import { Container, Photo, Name, Email } from './styles';

export function User() {
  return (
    <Container>
      <Photo
        source={{ uri: "" }}
      />

      <Name>
        Rodrigo
      </Name>

      <Email>
        rodrigo@email.com
      </Email>
    </Container>
  );
}