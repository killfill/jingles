#!/usr/bin/bash

USER=jingles
GROUP=www
DOMAIN="project-fifo.net"
CERTDIR="/var/db/fifo"
SUBJ="
C=AU
ST=Victoria
O=Company
localityName=Melbourne
commonName=$DOMAIN
organizationalUnitName=Widgets
emailAddress=blah@blah.com
"


fail_if_error() {
    [ $1 != 0 ] && {
        unset PASSPHRASE
        exit 10
    }
}

case $2 in
    PRE-INSTALL)
        if [ ! -d /var/db/fifo ]
        then
            export PASSPHRASE=$(head -c 128 /dev/random  | uuencode - | grep -v "^end" | tr "\n" "d")
            echo "Creating certificates"
            mkdir -p $CERTDIR

            openssl genrsa -des3 -out $CERTDIR/$DOMAIN.key -passout env:PASSPHRASE 2048
            fail_if_error $?

            openssl req \
                -new \
                -batch \
                -subj "$(/opt/local/gnu/bin/echo -n "$SUBJ" | /opt/local/gnu/bin/tr "\n" "/")" \
                -key $CERTDIR/$DOMAIN.key \
                -out $CERTDIR/$DOMAIN.csr \
                -passin env:PASSPHRASE
            fail_if_error $?

            cp $CERTDIR/$DOMAIN.key $CERTDIR/$DOMAIN.key.org
            fail_if_error $?

            openssl rsa -in $CERTDIR/$DOMAIN.key.org -out $CERTDIR/$DOMAIN.key -passin env:PASSPHRASE
            fail_if_error $?

            openssl x509 -req -days 365 -in $CERTDIR/$DOMAIN.csr -signkey $CERTDIR/$DOMAIN.key -out $CERTDIR/$DOMAIN.crt
            fail_if_error $?

            cat $CERTDIR/$DOMAIN.key $CERTDIR/$DOMAIN.crt > $CERTDIR/$DOMAIN.pem

            chgrp -R $GROUP $CERTDIR

            unset PASSPHRASE
        fi

        ;;
    POST-INSTALL)
        #echo Trying to guess network configuration ...

        #if ifconfig net1 > /dev/null 2>&1
        #then
        #    IP=`ifconfig net1 | grep inet | awk -e '{print $2}'`
        #else
        #    IP=`ifconfig net0 | grep inet | awk -e '{print $2}'`
        #fi
        if [ ! -f /opt/local/jingles/app/script/config.js ]
        then
            cp /opt/local/jingles/app/script/config.js.example /opt/local/jingles/app/script/config.js
        fi
        #sed --in-place=.bak -e "s/127.0.0.1/${IP}/g" /opt/local/wiggle-ui/htdocs/js/config.js
        ;;
esac
