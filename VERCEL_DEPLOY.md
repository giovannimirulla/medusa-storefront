# Deploy Frontend su Vercel

## Prerequisiti
- Account Vercel (https://vercel.com)
- Repository GitHub del frontend
- Backend Medusa deployato su Render: `https://medusa-backend-6uxo.onrender.com`

## Variabili d'ambiente richieste

### 1. MEDUSA_BACKEND_URL
Backend URL per chiamate server-side
```
https://medusa-backend-6uxo.onrender.com
```

### 2. NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
Publishable key del backend (trovalo nel database o creane uno nuovo)
```
pk_8ec154905f99bd8ae0019415203b91c18c097c1d536a76da4b5f94c7da03d185
```

### 3. NEXT_PUBLIC_BASE_URL
URL del tuo storefront Vercel (verrà fornito dopo il primo deploy)
```
https://tuodominio.vercel.app
```

### 4. NEXT_PUBLIC_DEFAULT_REGION
Regione di default per lo store
```
it
```

### 5. NEXT_PUBLIC_STRIPE_KEY (opzionale)
Chiave pubblica Stripe per i pagamenti
```
pk_test_...
```

### 6. REVALIDATE_SECRET
Secret per la revalidation on-demand di Next.js
```
supersecret
```

## Passi per il deploy

### 1. Crea repository GitHub
```bash
# Già fatto! Repository locale inizializzato
git remote add origin https://github.com/giovannimirulla/medusa-storefront.git
git push -u origin main
```

### 2. Configura CORS nel backend
Prima di fare il deploy, devi aggiornare il CORS nel backend Render.
Nel dashboard Render, aggiungi queste variabili d'ambiente:

**STORE_CORS:**
```
http://localhost:8000,https://tuodominio.vercel.app,https://docs.medusajs.com
```

**ADMIN_CORS:**
```
http://localhost:5173,http://localhost:9000,https://tuodominio.vercel.app,https://docs.medusajs.com
```

**AUTH_CORS:**
```
http://localhost:5173,http://localhost:9000,http://localhost:8000,https://tuodominio.vercel.app,https://docs.medusajs.com
```

### 3. Deploy su Vercel

1. Vai su https://vercel.com/new
2. Importa il repository `medusa-storefront`
3. Framework Preset: **Next.js**
4. Build Command: `bun run build`
5. Install Command: `bun install`
6. Aggiungi le variabili d'ambiente sopra elencate
7. Deploy!

### 4. Post-deploy
1. Copia l'URL fornito da Vercel (es. `https://medusa-storefront-xxx.vercel.app`)
2. Aggiorna `NEXT_PUBLIC_BASE_URL` nelle environment variables di Vercel
3. Aggiorna il CORS nel backend Render con il nuovo URL
4. Redeploy entrambi i servizi

## Note importanti

- Il frontend usa Bun come package manager (configurato in `vercel.json`)
- La regione Vercel è impostata su Frankfurt (`fra1`) per vicinanza al backend
- L'admin dashboard sarà hostato separatamente in futuro
- Wishlist e Reviews sono già integrati nel frontend

## Troubleshooting

### CORS errors
Se vedi errori CORS, verifica che:
- L'URL del frontend sia aggiunto correttamente nelle env vars del backend
- Non ci siano trailing slash negli URL
- Il backend sia stato redeployato dopo le modifiche CORS

### Build errors
- Verifica che tutte le env vars siano configurate
- Controlla i log di build su Vercel
- Assicurati che il backend sia raggiungibile

### Runtime errors
- Verifica che `MEDUSA_BACKEND_URL` punti al backend corretto
- Controlla che il publishable key sia valido
- Verifica i logs del backend per errori API
