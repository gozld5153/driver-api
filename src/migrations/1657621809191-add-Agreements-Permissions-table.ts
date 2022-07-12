import { MigrationInterface, QueryRunner } from "typeorm";

export class addAgreementsPermissionsTable1657621809191 implements MigrationInterface {
    name = 'addAgreementsPermissionsTable1657621809191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`agreed\` tinyint NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`agreements\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`agreed\` tinyint NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD CONSTRAINT \`FK_eab26c6cc4b9cc604099bc32dff\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`agreements\` ADD CONSTRAINT \`FK_5accca2ae885a1a900dec683dfb\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`agreements\` DROP FOREIGN KEY \`FK_5accca2ae885a1a900dec683dfb\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP FOREIGN KEY \`FK_eab26c6cc4b9cc604099bc32dff\``);
        await queryRunner.query(`DROP TABLE \`agreements\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
    }

}
