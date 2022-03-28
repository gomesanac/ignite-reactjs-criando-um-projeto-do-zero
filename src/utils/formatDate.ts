import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const formatDate = (date: string): string => {
  const formatedDate = format(new Date(date), 'PP', {
    locale: ptBR,
  });

  return formatedDate;
};

export default formatDate;
