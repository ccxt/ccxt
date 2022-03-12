#!/usr/bin/env bash

function usage() {
    echo "usage: $0 [-clsh] exchange method [...args]"
    echo "	-c      Number of lines to trim off the top and bottom of output"
    echo "	-l      View in less editor"
    echo "	-s      Remove special characters"
    echo "	-h      Display help"
    exit 1
}

if [[ $# < 1 ]]; then
  usage
fi


cliFolder='./examples'

jsCli="${cliFolder}/js/cli.js"
pythonCli="${cliFolder}/py/cli.py"
phpCli="${cliFolder}/php/cli.php"

useLess=false
removeSpecial=false
numLines=0

function display () {
    # Displays output in a less window or just to stdout
    if ${useLess}; then
        less -S -R
    else
        tee
    fi
}

function removeSpecial {
    # Removes special characters
    if ${removeSpecial}; then
        sed -e 's/\[[0-9]\{1,2\}m//g'
    else
        tee
    fi
}

function condense {
    # Trims output down to a set number of lines on the top and the bottom
    if [ ${numLines} -gt 0 ]; then
        awk 'NF' | awk -v head=${numLines} -v tail=${numLines} 'FNR<=head
            {lines[FNR]=$0}
            END{
                for (i=FNR-tail+1; i<=FNR; i++) print lines[i]
            }'
    else
        tee
    fi
}

function removeAndColorLines {
  sed -E -e '/.*(iteration|Array|^202.*|^$)/d' -e 's/  / /g' -e "s/(.*)/$(tput setaf $color)\1$(tput sgr0)/"
}

function writeOutput() {
  local interpretter="$1"
  local path="$2"
  local args="$3"
  $interpretter "$path" $args | removeSpecial | removeAndColorLines $color
}

# Loop through command line arguments
while getopts 'hc:sl' flag; do
    case "${flag}" in
        h) usage ;;
        c) numLines="${OPTARG}" ;;
        s) removeSpecial=true ;;
        l) useLess=true ;;
        *) usage ;;
    esac
done

shift $((OPTIND-1))

args="$@"

color=3
jsOutput=$(writeOutput node $jsCli "--no-table $args")
((color++))

pythonOutput=$(writeOutput python3 $pythonCli "$args")
((color++))

# python has the shortest output
length=$(wc -l <<< "$pythonOutput")

phpOutput=$(writeOutput php $phpCli "$args")
((color++))

paste <(echo "$jsOutput") <(echo "$phpOutput") <(echo "$pythonOutput") | column -s $'\t' -t | head -n $length | condense | display
