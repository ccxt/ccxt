cliFolder='./examples'

jsCli="${cliFolder}/js/cli.js"
pyCli="${cliFolder}/py/cli.py"
phpCli="${cliFolder}/php/cli.php"

function display () {
    if [ $use_less ]; then
        echo $1 | less -S -R
    else
        echo $1
    fi
}

function remove_special () {
    if [ $remove_special ]; then
        echo $1 | sed -e 's/\[[0-9]\{1,2\}m//g'
    else
        echo $1
    fi
}

function condense () {
    if [ $num_lines ]; then
        echo $1 | awk 'NF' | awk -v head=$num_lines -v tail=$num_lines 'FNR<=head
            {lines[FNR]=$0}
            END{
                print "..."
                for (i=FNR-tail+1; i<=FNR; i++) print lines[i]
            }'
    else
        echo $1
    fi
}

function help() {
    echo "usage:"
    echo "	-c,--condense    Number of lines to trim off the top and bottom of output"
    echo "	-l,--less        View in less editor"
    echo "	-s,--special     Remove special characters"
    echo "	-h,--help        Display help"
    echo "	-a,--args        exchange method"
}

case $* in
--help|-h)
help
;;
--condense|-c)
num_lines=c
;;
--special|-s)
remove_special=True
;;
--less|-l)
use_less=True
;;
*)
help
;;
esac

nodeOutput=$(node $jsCli ${args} | remove_special | condense )
pythonOutput=$(python3 $pyCli ${args} | remove_special | condense )
phpOutput=$(php $phpCli ${args} | remove_special | condense )
paste <$(echo ${nodeOutput}) <$(echo ${pythonOutput}) $(echo ${phpOutput}) | column -s $'\t' -t | display

exit 0
