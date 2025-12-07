# Panorama do Banco de Dados

Atualmente, o aplicativo "Gerente de Bolso" utiliza uma abordagem híbrida de armazenamento no lado do cliente (Client-Side Storage), combinando **IndexedDB** para dados estruturados e volumosos, e **LocalStorage** para configurações simples e persistência leve.

Não há um banco de dados backend centralizado (como Postgres ou MySQL) conectado diretamente neste momento; toda a persistência é local no dispositivo do usuário.

## Estrutura de Armazenamento

### 1. IndexedDB (`GerenteDeBolsoDB`)
Utilizado para armazenar as entidades principais do negócio devido à melhor performance e capacidade de armazenamento.

*   **Database Name:** `GerenteDeBolsoDB`
*   **Version:** 1

#### Object Stores (Tabelas)

| Store Name | Key Path | Index | Descrição |
| :--- | :--- | :--- | :--- |
| **`clients`** | `id` | - | Armazena a lista de clientes cadastrados. |
| **`appointments`** | `id` | `clientId`, `date` | Armazena os agendamentos. |

### 2. LocalStorage
Utilizado para dados simples, configurações e documentos gerados (orçamentos/recibos).

| Key | Tipo de Dado | Descrição |
| :--- | :--- | :--- |
| `gerente_bolso_profile` | `JSON Object` | Perfil do usuário (dados do prestador de serviço). |
| `gerente_bolso_documents` | `JSON Array` | Lista de orçamentos e recibos gerados (`SavedDocument[]`). |

## Esquema de Dados (Types)

### Client (IndexedDB: `clients`)
```typescript
interface Client {
  id: string;          // UUID
  name: string;        // Nome do cliente
  phone: string;       // Telefone de contato
  email?: string;      // Email (opcional)
  address?: string;    // Endereço (opcional)
  notes?: string;      // Observações (opcional)
  tags?: string[];     // Tags para categorização
  birthday?: string;   // Data de aniversário (MM-DD)
  createdAt?: string;  // Data de criação (ISO)
}
```

### Appointment (IndexedDB: `appointments`)
```typescript
interface Appointment {
  id: string;          // UUID
  clientId: string;    // FK para Client.id
  date: string;        // Data e hora do agendamento (ISO)
  service: string;     // Nome do serviço
  price: number;       // Valor do serviço
  status: 'pending' | 'completed' | 'cancelled';
}
```

### SavedDocument (LocalStorage: `gerente_bolso_documents`)
Refere-se a Orçamentos e Recibos.

```typescript
interface SavedDocument {
  id: string;
  type: 'quote' | 'receipt';
  documentNumber: string; // Ex: ORC-123456
  clientId: string;
  clientName: string;
  clientPhone: string;
  items: InvoiceItem[];
  total: number;
  createdAt: string;
  // ...outros campos de metadados
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}
```

### UserProfile (LocalStorage: `gerente_bolso_profile`)
```typescript
interface UserProfile {
  name: string;
  profession: string;
  phone: string;
  email: string;
  companyName?: string;
  logo?: string; // Imagem em Base64
}
```

## Observações Importantes
1.  **Persistência:** Os dados persistem apenas no navegador do dispositivo atual. Se o usuário limpar o cache/dados do navegador, **tudo será perdido**.
2.  **Sincronização:** Não há sincronização entre dispositivos.
3.  **Backup:** Atualmente não há mecanismo de backup/exportação de dados implementado no código analisado.
