# Wishlist & Product Reviews Integration

Questo frontend Next.js include l'integrazione completa con i plugin Wishlist e Product Reviews del backend Medusa.

## Funzionalità Implementate

### 🛍️ Wishlist

#### Componenti
- **WishlistButton**: Pulsante per aggiungere/rimuovere prodotti dalla wishlist
- **Wishlist Page**: Pagina dedicata per visualizzare tutti i prodotti nella wishlist

#### API Endpoints Utilizzati
- `GET /store/customers/me/wishlist` - Recupera la wishlist del cliente
- `POST /store/customers/me/wishlist/items` - Aggiunge un prodotto alla wishlist
- `DELETE /store/customers/me/wishlist/items/{productId}/{variantId}` - Rimuove un prodotto

#### Dove è integrato
1. **Pagina Prodotto**: Pulsante cuore accanto al bottone "Aggiungi al carrello"
2. **Account Menu**: Link "Wishlist" nel menu dell'account
3. **Wishlist Page**: `/account/wishlist` - Visualizza tutti i prodotti salvati

### ⭐ Product Reviews

#### Componenti
- **ReviewsList**: Lista delle recensioni di un prodotto
- **ReviewForm**: Form per creare nuove recensioni
- **ReviewStats**: Statistiche con rating medio e numero recensioni

#### API Endpoints Utilizzati
- `GET /store/product-reviews?product_id={id}` - Recupera le recensioni di un prodotto
- `GET /store/product-review-stats/{productId}` - Recupera le statistiche delle recensioni
- `POST /store/product-reviews` - Crea una nuova recensione
- `DELETE /store/product-reviews/{reviewId}` - Elimina una recensione

#### Dove è integrato
1. **Pagina Prodotto**: Sezione recensioni sotto i prodotti correlati con:
   - Statistiche (rating medio e numero recensioni)
   - Lista completa delle recensioni
   - Form per scrivere nuove recensioni

## Struttura File

```
src/
├── lib/
│   └── data/
│       ├── wishlist.ts          # API calls per wishlist
│       └── reviews.ts           # API calls per reviews
├── modules/
│   ├── wishlist/
│   │   └── components/
│   │       ├── wishlist-button.tsx
│   │       └── index.ts
│   ├── reviews/
│   │   └── components/
│   │       ├── reviews-list.tsx
│   │       ├── review-form.tsx
│   │       ├── review-stats.tsx
│   │       └── index.ts
│   ├── products/
│   │   ├── components/
│   │   │   └── product-actions/
│   │   │       └── index.tsx    # Aggiunto WishlistButton
│   │   └── templates/
│   │       └── index.tsx        # Aggiunta sezione recensioni
│   └── account/
│       └── components/
│           └── account-nav/
│               └── index.tsx    # Aggiunto link wishlist
└── app/
    └── [countryCode]/
        └── (main)/
            └── account/
                └── wishlist/
                    └── page.tsx # Pagina wishlist
```

## Dipendenze Installate

- `lucide-react` - Libreria di icone (Heart, Star, Trash2, ecc.)

## Note di Implementazione

### Autenticazione
Entrambe le funzionalità richiedono che l'utente sia autenticato. Gli endpoint utilizzano `getAuthHeaders()` per includere il token di autenticazione.

### Gestione Errori
- Se l'utente non è autenticato, viene mostrato un messaggio di errore
- Le recensioni vengono visualizzate solo dopo l'approvazione da parte dell'admin

### Cache
- Le liste di recensioni e statistiche utilizzano React `cache()` per ottimizzare le performance
- I tag di revalidazione sono impostati per aggiornare i dati quando necessario

### Styling
- Utilizza i componenti UI di Medusa (`@medusajs/ui`)
- Stile responsive con Tailwind CSS
- Icone da `lucide-react`

## Come Utilizzare

### Wishlist
1. L'utente deve essere loggato
2. Nella pagina prodotto, cliccare sul cuore per aggiungere alla wishlist
3. Accedere a `/account/wishlist` per vedere tutti i prodotti salvati
4. Cliccare sull'icona cestino per rimuovere prodotti

### Reviews
1. Navigare su una pagina prodotto
2. Scrollare fino alla sezione "Recensioni"
3. Compilare il form con rating, titolo e contenuto
4. Le recensioni appariranno dopo l'approvazione dell'admin

## Configurazione Backend Richiesta

Assicurarsi che il backend Medusa abbia installato e configurato:
1. Plugin `@giovannimirulla/medusa-wishlist`
2. Plugin `product-reviews`
3. CORS configurato per accettare richieste da `http://localhost:8000`

## Variabili d'Ambiente

```env
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_8ec154905f99bd8ae0019415203b91c18c097c1d536a76da4b5f94c7da03d185
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=it
```

## Testing

Per testare le funzionalità:

1. **Wishlist**:
   - Creare un account o effettuare il login
   - Aggiungere prodotti alla wishlist
   - Verificare che appaiano in `/account/wishlist`
   - Rimuovere prodotti dalla wishlist

2. **Reviews**:
   - Visitare una pagina prodotto
   - Scrivere una recensione
   - Verificare che appaia dopo l'approvazione admin

## Miglioramenti Futuri

- [ ] Notifiche toast per conferme azioni (aggiunto/rimosso da wishlist)
- [ ] Paginazione per liste recensioni lunghe
- [ ] Filtri e ordinamento recensioni
- [ ] Condivisione wishlist via link
- [ ] Immagini nelle recensioni
- [ ] Risposte alle recensioni da parte dei venditori
