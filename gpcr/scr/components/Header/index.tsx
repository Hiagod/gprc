import React from 'react';
import { Container, Subtitle, Title } from './styles';

export function Header() {
  return (
    <Container>
      <Title>
        Gerenciador{'\n'}
        de Presença{'\n'}
      </Title>
      <Subtitle>
      Acessar sua conta
      </Subtitle>
    </Container>
  )
}