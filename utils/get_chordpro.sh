#!/usr/bin/env bash -e

if [ ${BASH_VERSINFO[0]} -lt 4 ]; then
  echo "Need bash version 4 or greater"
fi

get_songs(){
    BOOK_URL=$1
    MAX=$2
    BOOK_UPPER=${1^^}
    DIR="ChordPro_$BOOK_UPPER"
    mkdir -p "$DIR"
    for a in $( seq -f "%03g" $MAX ); do 
        OUT="$DIR/song$a.chordpro"
        if [ ! -s $OUT ]; then
        echo "Downloading $BOOK_UPPER $a"
        curl -s https://jemaf.fr/ressources/chordPro/$BOOK_URL$a.chordpro > $OUT
        fi
    done
}

echo "Getting songs from JEM"
get_songs jem 1151
echo "Getting songs from JEM-Kids"
get_songs jemk 195
echo "All downloaded"