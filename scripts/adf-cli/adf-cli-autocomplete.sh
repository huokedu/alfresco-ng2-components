#!/usr/bin/env bash
# http://davidalger.com/development/bash-completion-on-os-x-with-brew/
# https://debian-administration.org/article/316/An_introduction_to_bash_completion_part_1
# https://debian-administration.org/article/317/An_introduction_to_bash_completion_part_2

# Possible commands:
# adf help
# adf ls
# adf[f][f] demo [gitjsapi commit-ish]
# adf[f][f] build [component name without prefix] [gitjsapi commit-ish]
# adf[f][f] test [component name without prefix] [gitjsapi commit-ish]
# adf[f][f] debug [component name without prefix] [gitjsapi commit-ish]

CLIDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

_adf() 
{
    local cur prev commands components
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    commands="help ls demo build test debug"
    components=`ls $CLIDIR/../../ng2-components/ | grep ng2 | sed 's/^ng2-//' | sed -e ':a' -e 'N' -e '$!ba' -e 's/\n/ /g'`

    case "${prev}" in
        ls|build|test|debug)
            COMPREPLY=( $(compgen -W "${components}" -- ${cur}) )
            return 0
            ;;
        *)
        ;;
    esac

    if [[ $COMP_CWORD == 1 ]]
    then
        COMPREPLY=($(compgen -W "${commands}" -- ${cur}))  
    fi 
   
    return 0
}
complete -F _adf adf
complete -F _adf adff
complete -F _adf adfff