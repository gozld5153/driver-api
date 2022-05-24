import { MigrationInterface, QueryRunner } from "typeorm";

export class modifyInvoicesTable1653410755504 implements MigrationInterface {
    name = 'modifyInvoicesTable1653410755504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_cfa3817af5e56ffc5adef90d4e\` ON \`orders\``);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`type\` \`type\` varchar(255) NOT NULL DEFAULT 'driver-hero '`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`totalFee\` \`totalFee\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`driverFee\` \`driverFee\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`heroFee\` \`heroFee\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`goochooriFee\` \`goochooriFee\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`transferStartedAt\` \`transferStartedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`transferFinishedAt\` \`transferFinishedAt\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`transferFinishedAt\` \`transferFinishedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`transferStartedAt\` \`transferStartedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`goochooriFee\` \`goochooriFee\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`heroFee\` \`heroFee\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`driverFee\` \`driverFee\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`totalFee\` \`totalFee\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`type\` \`type\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_cfa3817af5e56ffc5adef90d4e\` ON \`orders\` (\`invoiceId\`)`);
    }

}
