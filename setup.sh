
pip install --upgrade pip
pip install Django psycopg2-binary django-environ whitenoise

if [ -f "package.json" ]; then
  npm install
  npm run build || npm run dev
fi


if [ -f "manage.py" ]; then
  python manage.py migrate
  python manage.py collectstatic --noinput
fi
