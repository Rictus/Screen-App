
-- Selectionner tous les slides ayant besoin d'être diffusé pour une audience selectionnée
-- Tous les slides respectant les conditions suivantes :
-- 1 : La diffusion doit commencer 
-- 2 : N'est pas expiré
-- 3 : Respectant l'audience selectionné (l'audience 0 = tout le monde)
-- 4 : Qui n'ont pas été marqué supprimé par un utilisateur
-- Principe pour les dates : On convertit le temps (année/mois/jour/heure/minute/seconde) en secondes 
-- et on compare avec la date actuelle
SELECT	`id`, `titre`, `type`, `date_debut`, `date_fin`, `time_debut`, `time_fin`, `importance`, `audience`, `texte`, `image_url`, `video_url`, `id_user`, `supprime`  
FROM	`slide` 
WHERE 	(TO_DAYS(`date_debut`)*3600*24)+TIME_TO_SEC(`time_debut`)	<=	(TO_DAYS(NOW())*3600*24)+TIME_TO_SEC(NOW()) 
AND		(TO_DAYS(`date_fin`)  *3600*24)+TIME_TO_SEC(`time_fin`)		>	(TO_DAYS(NOW())*3600*24)+TIME_TO_SEC(NOW()) 
AND audience=? 
AND supprime='false';

-- Création d'une vue rassemblant les ids de tous les slides encombrant la base de données et n'étant plus utilisées
-- Les id de tous les slides respectant l'une des conditions suivantes :
-- 1 : Est expiré depuis plus de 30 jours
-- 2 : Est une image mais le champ image_url est 'null'
-- 3 : Est une vidéo mais le champ video_url est 'null'
-- 4 : Est un slide de type textimage ou text mais le texte est 'null'
-- 5 : Marqué supprimé par un utilisateur
-- 6 : Cible une audience qui n'existe pas
CREATE VIEW slides_to_delete AS
SELECT `id`
FROM `slide`
WHERE	(TO_DAYS(`date_fin`)  *3600*24)+TIME_TO_SEC(`time_fin`)+30*24*60*60		<	(TO_DAYS(NOW())*3600*24)+TIME_TO_SEC(NOW()) 
OR		( slide.type='image' AND slide.image_url='null')
OR		( slide.type='video' AND slide.video_url='null')
OR		(( slide.type='textimage' OR slide.type='text') AND slide.texte='null')
OR		( slide.supprime='true')
OR		( slide.audience<> ALL (SELECT id from audience));